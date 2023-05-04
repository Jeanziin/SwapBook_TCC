const Product = require('../Models/Product')
const User = require('../Models/User')
module.exports = {
    async create(req, res) {
        const dateUTC = new Date(Date.now()).toUTCString();
        const { name, price, author, category, synopsis,year} = req.body

        const { user_id } = req.params

        const { auth } = req.headers
        

        if(user_id !== auth) return res.status(400).send({ message: 'nao autorizando'})
       
        
        try{
            const userInfo = await User.findById(user_id)
            
            const {location} = userInfo
            const latitude = location.coordinates[0]
            const longitude = location.coordinates[1]

            const setLocation = {
                type: 'Point',
                coordinates: [longitude, latitude]
            }

            const createdProduct = await Product.create({name, price, user: user_id, location: setLocation, author, category, synopsis, year,  src: req.file.path, dateUTC})
            const populatedProduct = await Product.findById(createdProduct._id).populate('user')
           

            return res.status(201).send(populatedProduct)
        }catch(err){
            console.log('foi aqui')
            return res.status(400).send(err)
        }
    },
    
    async update(req, res) {
  const { name, price, author, category, synopsis, year } = req.body;
  const { user_id, product_id } = req.params;
  const { auth } = req.headers;

  if (user_id !== auth) {
    return res.status(400).send({ message: 'Não autorizado' });
  }

  try {
    const userInfo = await User.findById(user_id);
    const { location } = userInfo;
    const latitude = location.coordinates[0];
    const longitude = location.coordinates[1];
    const setLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      {
        name,
        price,
        user: user_id,
        location: setLocation,
        author,
        category,
        synopsis,
        year,
        src: req.file.path,
      },
      { new: true }
    ).populate('user');

    return res.status(200).send(updatedProduct);
  } catch (err) {
    console.log('Erro:', err);
    return res.status(400).send({ message: 'Erro ao atualizar o produto' });
  }
}

    ,

    async delete(req, res){
        

        const { product_id, user_id} = req.params 
        const { auth } = req.headers
       

        if(user_id !== auth) return res.status(400).send({ message: 'nao autorizando' })
       


        try{
            const deletedProduct = await Product.findByIdAndDelete(product_id)
            return res.status(200).send({ status: "deleted", user: deletedProduct })  
        }catch (err){
            return res.status(400).send(err)
        }
    },
    async indexByUser(req, res){
        const { user_id }= req.params

        try{
            const allProductsOfAUser = await Product.find({ user: user_id })
            return res.status(200).send(allProductsOfAUser)
        }catch(err){
        return res.status(400).send(err)
        }
    },
    async indexCords(req, res){
        const { latitude, longitude  } = req.query
        const maxDistance = 10000

    try{
        const allProducts = await Product.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [latitude , longitude ]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).populate('user')

        return res.status(200).send(allProducts)
    }
    catch (err){
        return res.sendStatus(400).send(err)
    }
    },

    async indexAll(req, res){
        
    try{
        const allProducts = await Product.find({
        }).populate('user')

        return res.status(200).send(allProducts)
    }
    catch (err){
        return res.sendStatus(400).send(err)
    }
    },

    async indexProd(req, res){
        const {product_id }= req.params

        try{
            const allProducts = await Product.findById(product_id)
            return res.status(200).send(allProducts)
        }catch(err){
        return res.status(400).send(err)
        }
    }

    

}