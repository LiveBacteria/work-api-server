module.exports = {
    index(req, res, next){
        res.send("This server is not designed to be accessed directly.");
    },

    login(req, res, next){
        const form = {content: `<div class="container"><div><p>Username</p><input type='text' id='loginEntry'></input></div><div><p>Password</p><input type='password' id='passwordEntry'></input></div><input type='submit' id='submitBtn' value='Submit'></input></div>`};
        res.send(form);
    }
}