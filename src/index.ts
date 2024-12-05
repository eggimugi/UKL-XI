import Express from "express";
import UserRoute from "./router/userRouter";
import InventoryRoute from "./router/inventoryRouter";
import BorrowRoute from "./router/borrowRouter";

const app = Express();

app.use(Express.json());

app.use(`/api`, UserRoute);
app.use(`/api`, InventoryRoute);
app.use(`/api`, BorrowRoute);

const PORT = 1780;
app.listen(PORT, () => {
  console.log(`Server peminjaman run on port ${PORT}`);
});
