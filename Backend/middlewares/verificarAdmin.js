module.exports = (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "gerente") {
        console.log("❌ Acesso negado: usuário não é administrador nem gerente");
        return res.status(403).json({ message: "Acesso negado. Permissão insuficiente." });
    }
    next();
    
};
