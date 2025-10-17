
function requestLogging(req, res, next) {
    const {method, originalUrl} = req;
    const ip = req.ip.split(":").slice(-1)[0];
    console.log(`\n${method} ${originalUrl} from ${ip}`);

    next();
};

export default requestLogging;