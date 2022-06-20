import express from "express"
import db from "../db/conn"

const recordRoutes = express.Router()

recordRoutes.route("/tables").get(
    async function (req, res) {
        const dbConnect = db.getDb()

        dbConnect
            .collection("table")
            .find({}).limit(50)
            .toArray(
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error fetching listings")
                    } else {
                        res.json.result
                    }
                }
            )
    }
)
