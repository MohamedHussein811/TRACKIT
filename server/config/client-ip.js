export const getClientIP = (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.headers['x-client-ip'] ||
      req.connection.remoteAddress ||
      req.ip
    );
  };
