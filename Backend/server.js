require('dotenv').config()
const app= require("./src/App")


 app.listen(3000, () => {
     console.log(" server is running on http/3000");
     
 })