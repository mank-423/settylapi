const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/usermodel')
const item = require('./models/Item')
const Transaction = require('./models/Transaction')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const http = require('http');
const webSocketServer = require('websocket').server;
const jwtSecret = 'secret123'
const PORT = 5000


async function connect() {
    try {
        await mongoose.connect('mongodb+srv://mankmern:mankmern@mernproject.bicx37m.mongodb.net/settyl?retryWrites=true&w=majority', { useNewUrlParser: true })
        console.log("Connect to mongoDB");
    } catch (error) {
        console.log(error);
    }
}

connect();

app.use(cors())
app.use(express.json())

//Working on validation while registering
app.post('/api/register', async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10);

        const user = await User.create({
            name: req.body.name,
            username: req.body.userName,
            email: req.body.email,
            password: newPassword,
        })

        res.json({ status: 'ok' });
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'Duplicate email' });
    }
})

app.post('/api/login', async (req, res) => {
    const newPassword = bcrypt.hash(req.body.password, 10)

    const user = await User.findOne({
        email: req.body.email,
        // password: req.body.password,
    })
    if (!user) {
        return res.json({
            status: 'error',
            error: 'Invalid Email'
        })
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (isPasswordValid) {
        const token = jwt.sign({
            name: user.name,
            email: user.email,
        }, jwtSecret);

        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false });
    }
})

app.post('/api/items', async (req, res) => {
    try {
        // Get the token from the request headers
        const token = req.headers['x-access-token'];

        // Verify the token to get the user information
        const decoded = jwt.verify(token, jwtSecret); // Replace with your actual secret key

        const newItem = new item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            user: req.body.user, // Associate the item with the user
        });

        await newItem.save();

        res.json({ status: 'ok', item: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});

// Update the route in your backend
app.get('/api/items/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const items = await item.find({ user: userId });
        res.json({ status: 'ok', items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});

app.put('/api/items/:id/close-bidding', async (req, res) => {
    const itemId = req.params.id;

    try {
        // Find the item with the specified id
        const currentItem = await item.findById(itemId);

        if (!currentItem) {
            return res.status(404).json({ status: 'error', error: 'Item not found' });
        }

        // Check if bidding is already closed
        if (currentItem.biddingStatus === 'closed') {
            return res.status(400).json({ status: 'error', error: 'Bidding is already closed for this item' });
        }

        // Update the item with the specified id to set biddingStatus to 'closed'
        const updatedItem = await item.findByIdAndUpdate(itemId, { biddingStatus: 'closed' }, { new: true });

        // Create a transaction
        const transaction = new Transaction({
            username: currentItem.user, // Assuming user is stored as the username in the Item model
            itemName: currentItem.name,
            closingPrice: currentItem.highestBidAmount,
            buyer: currentItem.highestBidder,
        });

        // Save the transaction to the database
        await transaction.save();

        if (updatedItem) {
            return res.json({ status: 'ok', message: 'Bidding closed successfully', updatedItem });
        } else {
            return res.status(404).json({ status: 'error', error: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});


// Update the route in your backend for placing bids
app.post('/api/items/:itemId/bid', async (req, res) => {
    const { itemId } = req.params;
    const { userId, bidAmount } = req.body;
  
    try {
      const Item = await item.findById(itemId);
  
      if (!Item) {
        return res.status(404).json({ status: 'error', error: 'Item not found' });
      }
  
      if (parseFloat(bidAmount) <= 0) {
        return res.status(400).json({ status: 'error', error: 'Bid amount must be greater than 0' });
      }
  
      if (parseFloat(bidAmount) <= Item.highestBidAmount) {
        return res.status(400).json({ status: 'error', error: 'Bid amount must be higher than the current highest bid' });
      }
  
      // Update item with the new bid
      Item.highestBidAmount = parseFloat(bidAmount);
      Item.highestBidder = userId;
  
      // Save the updated item
      await Item.save();
  
      return res.json({ status: 'ok', Item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
  });

  // Route to fetch transactions by username
app.get('/api/transactions/:username', async (req, res) => {
    const username = req.params.username;

    try {
        // Find transactions based on the provided username
        const transactions = await Transaction.find({ username });

        if (transactions.length > 0) {
            return res.json({ status: 'ok', transactions });
        } else {
            return res.status(404).json({ status: 'error', error: 'No transactions found for the specified username' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});
  

app.get('/api/items', async (req, res) => {
    try {
        const items = await item.find();
        res.json({ status: 'ok', items })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
})


const server = http.createServer(app);
const webSocketsServerPort = 8000;
const wsServer = new webSocketServer({
    httpServer: server
});

const clients = {};

// This code generates unique userid for every user.
const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};


wsServer.on('request', function (request) {
    var userID = getUniqueID();
    console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');

    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log('Connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ', message.utf8Data);

            // Broadcasting message to all connected clients excluding the sender
            Object.keys(clients).forEach(key => {
                if (key !== userID) {
                    clients[key].sendUTF(message.utf8Data);
                    console.log('Sent Message to: ', clients[key]);
                }
            });
        }
    });

    connection.on('close', function (reasonCode, description) {
        console.log('Connection closed:', userID, 'Reason:', reasonCode, description);
        delete clients[userID];
    });
});




app.get('/hello', (req, res) => {
    res.send("Hello World")
})


app.listen(PORT, (req, res) => {
    console.log("Server started on port", PORT);
})