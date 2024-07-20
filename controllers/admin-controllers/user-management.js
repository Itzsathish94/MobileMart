const { User } = require('../../models/userSchema')


const usersPage = async (req, res) => {
    try {
        const users = await User.find().lean()
        res.render('admin/userManagement', { admin: true, users, layout:'adminlayout' })
    } catch (error) {
        console.log(error)

    }
}

const blockUser = async (req, res) => {
    try {
        const {id} = req.body
        console.log(req.body,"aaaaaaaaaaaaaaaaaaaaa")
        const user = await User.findById(id)
        const newBlock = user.isBlocked


        await User.findByIdAndUpdate(
            id, {
            $set: {
                isBlocked: !newBlock
            }
        })
        res.json({
            success:true
        })
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    usersPage,
    blockUser
}