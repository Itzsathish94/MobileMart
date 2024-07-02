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
        const userId = req.params.id
        const user = await User.findById(userId)
        const newBlock = user.isBlocked


        await User.findByIdAndUpdate(
            userId, {
            $set: {
                isBlocked: !newBlock
            }
        })
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error)
    }
}















module.exports = {
    usersPage,
    blockUser
}