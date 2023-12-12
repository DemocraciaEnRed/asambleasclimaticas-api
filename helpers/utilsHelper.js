exports.getHost = (req) => {
  if(process.env.HOST_FRONTEND){
    return process.env.HOST_FRONTEND
  }
  return `http://${req ? req.headers.host : 'localhost'}${process.env.PORT ? ':' + process.env.PORT : ''}`
}