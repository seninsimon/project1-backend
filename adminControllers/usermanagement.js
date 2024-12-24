const User = require('../models/userModel')



const userManagement = async (req, res) => {

    const { id } = req.body

    try {

        if (id) {

            const user = await User.findById(id)

            console.log("blocked user data :", user);

            const blockedUser = await User.findByIdAndUpdate(id, { isBlocked: !user.isBlocked })

            if (blockedUser.isBlocked == true) {
                console.log(blockedUser.isBlocked);
                return res.status(200).json({ message: " user unBlocked successfully " })


            }
            else if (blockedUser.isBlocked == false) {
                console.log(blockedUser.isBlocked);

                return res.status(200).json({ message: " user blocked successfully " })
            }
        }

        const users = await User.find()
        console.log("all users ", users);

        res.status(200).json({ message: "user successfully fetched ", users: users })


    } catch (error) {

        console.log("internal server error : ", error);


    }
}


module.exports = userManagement