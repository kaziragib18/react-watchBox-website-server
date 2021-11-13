const express = require('express')
require('dotenv').config()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txagv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
      try {
            await client.connect()
            // console.log('database connected');
            const database = client.db('watchbox')
            const productsCollection = database.collection('products');

            const ordersCollection = database.collection('orders');

            const usersCollection = database.collection('users');

            const reviewsCollection = database.collection('reviews');

            //POST REVIEWS API
            app.post('/reviews', async (req, res) => {
                  const review = req.body;
                  console.log('hit the post api', review);
                  const result = await reviewsCollection.insertOne(review);
                  console.log(result);
                  res.json(result);
            });

            //GET REVIEWS API
            app.get('/reviews', async (req, res) => {
                  const cursor = reviewsCollection.find({});
                  const reviews = await cursor.toArray();
                  res.send(reviews);
            })
    


            //GET PRODUCT API
            app.get('/products', async (req, res) => {
                  const cursor = productsCollection.find({});
                  const products = await cursor.toArray();
                  res.send(products);
            })

            //GET ALL ORDER API
            // app.get('/orders', async (req, res) => {
            //       const cursor = ordersCollection.find({});
            //       const orders = await cursor.toArray();
            //       res.send(orders);
            // })


            //GET SINGLE PRODUCT
            app.get('/products/:id', async (req, res) => {
                  const id = req.params.id;
                  console.log('Getting specific product', id);
                  const query = { _id: ObjectId(id) };
                  const product = await productsCollection.findOne(query);
                  res.json(product);
            })


            //POST PRODUCT API
            app.post('/products', async (req, res) => {
                  const product = req.body;
                  console.log('hit the post api', product);
                  const result = await productsCollection.insertOne(product);
                  console.log(result);
                  res.json(result);
            });

            // GET ORDER API BY USER EMAIL
            app.get('/orders', async (req, res) => {
                  const cursor = ordersCollection.find({ email: req.query.email });
                  const orders = await cursor.toArray();
                  res.send(orders);

            })

            //POST ORDER API
            app.post('/orders', async (req, res) => {
                  const order = req.body;
                  console.log('hit the post api', order);
                  const result = await ordersCollection.insertOne(order);
                  console.log(result);
                  res.json(result);
            });

            app.get('/users/:email', async (req, res) => {
                  const email = req.params.email;
                  const query = { email: email };
                  const user = await usersCollection.findOne(query);
                  let isAdmin = false;
                  if (user?.role === 'admin') {
                        isAdmin = true;
                  }
                  res.json({ admin: isAdmin });
            })

            //POST USER
            app.post('/users', async (req, res) => {
                  const user = req.body;
                  const result = await usersCollection.insertOne(user);
                  console.log(result);
                  res.json(result);
            })

            //UPSERT USER
            app.put('/users', async (req, res) => {
                  const user = req.body;
                  const filter = { email: user.email };
                  const options = { upsert: true };
                  const updateDoc = { $set: user };
                  const result = await usersCollection.updateOne(filter, updateDoc, options);
                  res.json(result);
            })

            app.put('/users/admin', async (req, res) => {
                  const user = req.body;
                  console.log('put', user);
                  const filter = { email: user.email };
                  const updateDoc = { $set: { role: 'admin' } };
                  const result = await usersCollection.updateOne(filter, updateDoc);
                  res.json(result);
            })

            //DELETE PRODUCT API
            app.delete('/products/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const result = await productsCollection.deleteOne(query);
                  console.log(result);
                  res.json(result);
            });

            //DELETE ORDER API
            app.delete('/orders/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const result = await ordersCollection.deleteOne(query);
                  console.log(result);
                  res.json(result);
            })

      }
      finally {
            // await client.close();
      }

}

run().catch(console.dir);

app.get('/', (req, res) => {
      res.send('WatchBox Server is running')
})

app.listen(port, () => {
      console.log(`Server listening at ${port}`)
})