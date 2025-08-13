export function errorHandler(err, req, res, next) {
  // Log del error con más contexto
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Manejo de errores específicos de SQLite
  if (err.message.includes('SQLITE_ERROR')) {
    return res.status(500).json({
      error: 'Error de base de datos',
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Si el error ya fue manejado por el controlador
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
      ...(err.code && { code: err.code })
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  });
}   