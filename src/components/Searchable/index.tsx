import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const Searchable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const options = ["Option 1", "Option 2", "Option 3"];

  const handleInputChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const selectOption = (option: string) => {
    setSearchValue(option);
  };

  const handleOption = (option: string) => {
    selectOption(option);
    setOpenMenu(false);
  };

  const handleOpenMenu = () => {
    setOpenMenu(true);
  };

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    const results = options.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(results);
 }, [searchValue]);

  return (
    <>
      <div className="w-[400px]">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            placeholder="Search..."
            onChange={handleInputChange}
            onFocus={handleOpenMenu}
            className="w-full rounded border bg-[#222838] p-2 text-white focus:border-blue-500 focus:outline-none"
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-[#3374d9]"
            onClick={() => console.log("Search clicked")}
          />
        </div>

        {(openMenu && filteredOptions.length > 0 )&& (
          <ul
            ref={dropdownRef}
            className="absolute w-[400px] rounded-md bg-[#222838] px-3 py-2"
          >
            {filteredOptions.map((option) => (
              <li
                className="rounded-md px-3 py-2 text-white hover:bg-[#11141d]"
                key={option}
                onClick={() => handleOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Searchable;
