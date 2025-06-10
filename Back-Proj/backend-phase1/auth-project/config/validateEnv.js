module.exports = () => {
    if(!process.env.DB_CONNECTION) throw new Error("DB_CONNECTION is not defined");

    if(!process.env.PORT) throw new Error("PORT is not defined");
    
    if(!process.env.JWT_SECRET) {
        console.warn("⚠️ JWT_SECRET is not defined. Using default secret key (not secure for production)");
        process.env.JWT_SECRET = "mysecretkey";
    }

    console.log("✅ All env variables are set!");
}