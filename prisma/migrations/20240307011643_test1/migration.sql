-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Layout" (
    "layout_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "layout_name" TEXT NOT NULL,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("layout_id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "widget_id" SERIAL NOT NULL,
    "widget_name" TEXT NOT NULL,
    "widget_description" TEXT,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("widget_id")
);

-- CreateTable
CREATE TABLE "LayoutsWidgets" (
    "layout_id" INTEGER NOT NULL,
    "widget_id" INTEGER NOT NULL,

    CONSTRAINT "LayoutsWidgets_pkey" PRIMARY KEY ("layout_id","widget_id")
);

-- CreateTable
CREATE TABLE "_LayoutWidgets" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_LayoutWidgets_AB_unique" ON "_LayoutWidgets"("A", "B");

-- CreateIndex
CREATE INDEX "_LayoutWidgets_B_index" ON "_LayoutWidgets"("B");

-- AddForeignKey
ALTER TABLE "Layout" ADD CONSTRAINT "Layout_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutsWidgets" ADD CONSTRAINT "LayoutsWidgets_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "Layout"("layout_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutsWidgets" ADD CONSTRAINT "LayoutsWidgets_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "Widget"("widget_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayoutWidgets" ADD CONSTRAINT "_LayoutWidgets_A_fkey" FOREIGN KEY ("A") REFERENCES "Layout"("layout_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayoutWidgets" ADD CONSTRAINT "_LayoutWidgets_B_fkey" FOREIGN KEY ("B") REFERENCES "Widget"("widget_id") ON DELETE CASCADE ON UPDATE CASCADE;
