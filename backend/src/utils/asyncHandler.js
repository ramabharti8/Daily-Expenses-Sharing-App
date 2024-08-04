const asyncHandler = (asyncFn) =>
    async (req, res, next) => {
      try {
        return await asyncFn(req, res, next)
      } catch (error) {
       
        next(error)
      }
    }
  
  export { asyncHandler }