-- CreateTable
CREATE TABLE "LayoutConfig" (
    "id" SERIAL NOT NULL,
    "layout_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "layout_json" JSONB NOT NULL,

    CONSTRAINT "LayoutConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LayoutConfig_layout_id_user_id_key" ON "LayoutConfig"("layout_id", "user_id");

-- AddForeignKey
ALTER TABLE "LayoutConfig" ADD CONSTRAINT "LayoutConfig_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "Layout"("layout_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutConfig" ADD CONSTRAINT "LayoutConfig_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
