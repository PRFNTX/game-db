import express from "express"
import db from "../db/conn"

import {TableSpecification} from "../models/"

const router = express.Router()

function getObjects(ModelClass) {
    const dbConnect = db.getDb()
    return dbConnect.collection(ModelClass.collectionName)
    // TODO fetch related
}

router.use(
    function(req, res, next) {next()}
)

router.route("/tablespecifications").get(
    async function (req, res) {
         const objects = getObjects(TableSpecification)
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

router.route("/tables").get(
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
