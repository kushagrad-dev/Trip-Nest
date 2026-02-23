module.exports = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error("\n ERROR IN wrapAsync ");
            console.error("Time:", new Date().toISOString());
            console.error("Route:", req.method, req.originalUrl);
            console.error("Params:", req.params);
            console.error("Query:", req.query);
            console.error("Body:", req.body);
            console.error("Error Message:", err.message);

            if (err.stack) {
                console.error("Stack Trace:\n", err.stack);
            }

            console.error("===== END ERROR LOG ===== 🚨\n");
            next(err);
        }
    };
};