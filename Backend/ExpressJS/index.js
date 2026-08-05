// const express = require("express");
// const app = express();
// const PORT = 3000;

// app.use(express.json());

// let users = [
//     { id: 1, name: "Kartik" },
//     { id: 2, name: "Rahul" }
// ];

// // ================= GET =================

// app.get("/users", (req, res) => {
//     res.json(users);
// });

// // ================= POST =================

// app.post("/users", (req, res) => {

//     const newUser = req.body;

//     users.push(newUser);

//     res.json({
//         message: "User Added",
//         users
//     });

// });

// // ================= PUT =================

// app.put("/users/:id", (req, res) => {

//     const id = Number(req.params.id);

//     users = users.map(user => {
//         if (user.id === id) {
//             return req.body;
//         }
//         return user;
//     });

//     res.json({
//         message: "User Updated",
//         users
//     });

// });

// // ================= DELETE =================

// app.delete("/users/:id", (req, res) => {

//     const id = Number(req.params.id);

//     users = users.filter(user => user.id !== id);

//     res.json({
//         message: "User Deleted",
//         users
//     });

// });



// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


const express = require("express");
const app = express();
const port = 3000;

const authorization = require("./middleware");

app.use("/users", authorization);

// user apis starts here
app.get("/users", (req,res) => {
    res.send("User details");
})

// admin apis starts here
app.use("/admin", authorization);

app.get("/admin", (req, res) => {
    res.send("Admin Details");
});

app.get("/admin/create", (req, res) => {
    res.send("Admin Created!!!");
});

app.listen(port, () => {
    console.log("Server is listening!");
});
