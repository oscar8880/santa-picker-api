import * as express from "express";
import { assignRandomContacts } from "../utils/random";
const sgMail = require("@sendgrid/mail");
const router = express.Router();
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/", async (req, res) => {
  const { contacts, organiserName, spendingLimit } = req.body;
  const pairedContacts = assignRandomContacts(contacts);
  const emails = pairedContacts.map((contactPair) => {
    console.log(`Email request submitted by ${req.body.organiserName}`);
    console.log(`Sending ${req.body.contacts.length} emails`);
    return {
      to: contactPair.contact.email,
      from: "secretsantacourierelf@gmail.com",
      subject: "Your Secret Santa Nomination",
      templateId: "d-b1e6786eee434135a63f3a106eabf4ad",
      dynamicTemplateData: {
        contactName: contactPair.contact.name,
        organiserName: organiserName,
        assignedContactName: contactPair.assignedContact.name,
        spendingLimit:
          spendingLimit !== undefined
            ? `There's a recommended spend limit of ${spendingLimit}.`
            : "",
      },
    };
  });
  sgMail
    .send(emails)
    .then((response) => {
      console.log(
        `Successfully sent ${response.length}/${req.body.contacts.length} emails`
      );
      const status = 200;
      res.status(status).json({ status });
    })
    .catch((error) => {
      console.log(`Failed to send one or more emails`);
      console.log(error);
      const status = 500;
      res.status(status).json(error);
    });
});

export default router;
