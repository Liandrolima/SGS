const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        console.log("❌ Nenhum token fornecido");
        return res.status(403).json({ message: "Acesso negado. Nenhum token fornecido." });
    }

    try {
        const tokenSemBearer = token.replace("Bearer ", ""); // Remove "Bearer " do token
        const decoded = jwt.verify(tokenSemBearer, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("❌ Token inválido");
        return res.status(403).json({ message: "Token inválido." });
    }
};
