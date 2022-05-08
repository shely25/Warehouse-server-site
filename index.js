const express = require('express')
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const dotenv = require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xku4r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const client1 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        await client1.connect();
        const database = client.db("fasionFranzy").collection("products");
        const database1 = client1.db("fasionFranzy").collection("MyItem");
        function tokenVerify(req, res, next) {
            const authHead = req.headers.authorization.split(' ')[1]
            if (!authHead) {
                res.status(401).send({ message: 'Invalid' })
            }
            var decoded = jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
                if (err) {
                    res.status(403).send({ message: "forbidden" })
                }
                req.decoded = decoded
                console.log(req.decoded)
                next()
            });
        }
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = database.find(query);
            const products = await cursor.toArray();
            res.send(products)

        })
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await database.findOne(query);
            console.log(product)
            res.send(product)


        })

        // app.post('/inventory', async (req, res) => {
        //     const newData = req.body;
        //     const result = await database.insertOne(newData)
        //     res.send(result)
        // })
        app.post('/myitem', async (req, res) => {
            const newData = req.body;
            const result = await database1.insertOne(newData)
            res.send(result)
        })
        app.get('/myitem', tokenVerify, async (req, res) => {
            const query = req.query
            const email = query.email
            const verifyEmail = req.decoded.email
            if (email === verifyEmail) {
                const cursor = database1.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
            // const authHead = req.headers
            // console.log(authHead)
            // // console.log(authHead)

        })

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await database.deleteOne(query);
            //console.log(result)
            res.send(result)
        })
        app.delete('/myitem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await database1.deleteOne(query);
            //console.log(result)
            res.send(result)
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            console.log(updateQuantity)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateQuantity.quantity
                }
            };
            const result = await database.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.post('/login', async (req, res) => {
            const email = req.body
            var token = jwt.sign(email, process.env.jwtToken);
            res.send({ token })
        })
        app.post('/register', async (req, res) => {
            const email = req.body
            var token = jwt.sign(email, process.env.jwtToken);
            res.send({ token })
        })
    }
    finally {

    }

}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})