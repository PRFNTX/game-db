import {MongoClient} from "mongodb"
const connectionString = process.env.ATLAS_URI

const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

let dbConnection

export default {
    connetToServer: function (callback) {
        client.connect(function (err, db) {
            if (err || !db) {
                return callback(err)
            }

            dbConnection = db.db("sample_airbnb")
            console.log("Sucessfully connected to MongoDB.")

            return callback()
        })
    },

    getDb: function () {
        return dbConnection
    }
}
