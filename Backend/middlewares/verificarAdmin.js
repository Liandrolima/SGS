module.exports = (req, res, next) => {
    if (req.user.role !== "admin") {
        console.log("❌ Acesso negado: usuário não é administrador");
        return res.status(403).json({ message: "Acesso negado. Permissão insuficiente." });
    }
    next();
};
