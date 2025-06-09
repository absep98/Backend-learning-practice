// services folder to handle business logic (eg fetching, updating or deleting user)
// keeping controllers focused only on request/ response handling
const User = require("../Models/userModel")

async function getAllUsers({searchName, sortOrder, page, limit}) {
    let query = {};
    if(searchName) {
        query.name = { $regex: searchName, $option: "i"};
    }
    let usersQuery = User.find(query);

    if(sortOrder === "asc") {
        usersQuery = usersQuery.sort({ name: 1});
    } else if(sortOrder === "desc") {
        usersQuery = usersQuery.sort({ name: -1});
    }

    const skip = (page-1)*limit;
    usersQuery = usersQuery.skip(skip).limit(limit);
    const users = await usersQuery.exec();
    return users;
}