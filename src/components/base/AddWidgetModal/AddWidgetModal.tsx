import { useState } from "react";
import { Modal } from "..";
import { widgetList } from "../../../widgets";
import { Widget } from "../../../../types";

type Props = {
  onConfirm: (widget: Widget | null) => void;
  onCancel: () => void;
};

export default function AddWidgetModal({ onConfirm, onCancel }: Props) {
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  const onClickWidget = (w: Widget) => {
    setSelectedWidget(w);
    onConfirm(w);
  };

  return (
    <Modal
      title="Add Widget"
      bodyClassName="!max-w-[53%]"
      content={
        <div>
          <h3>Select a Widget</h3>
          <ul className="mt-2 flex max-h-[400px] flex-wrap gap-4 overflow-y-scroll">
            {widgetList.map((widget) => {
              // console.log('widget', widget);
              return (
                <li
                  key={widget?.info?.wid ?? ""}
                  className={`border-blue relative h-32 w-48 cursor-pointer rounded-md border-[1px] hover:border-gray-300`}
                  onClick={() => onClickWidget(widget)}
                  style={{
                    background: `url(${(widget as any)?.info?.thumbnail}) no-repeat center center`,
                    backgroundSize: "cover",
                  }}
                >
                  <div className="absolute bottom-0 w-full bg-black py-2 text-center capitalize opacity-80">
                    {widget?.info?.name ?? ""}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      }
      confirmLabel="Confirm"
      onCancel={onCancel}
      // onConfirm={() => onConfirm(selectedWidget)}
      showConfirm={false}
    />
  );
}
