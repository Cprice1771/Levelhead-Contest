const catchErrors = fn =>
    (req, res) => {
        Promise.resolve(fn(req, res)).catch((err) => {
            res.status(500).json({
                success: false, msg: err.message
            });
        });
    }

module.exports = catchErrors