const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { Client } = require("@notionhq/client");

app.set("view engine", "ejs");

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const getNotionPageInfo = async (pageId) => {
  return await notion.pages.retrieve({
    page_id: pageId,
  });
};

const updateNotionPage = async (pageId) => {
  return await notion.pages.update({
    page_id: pageId,
    properties: {
      대여상태: {
        select: {
          name: "신청중",
        },
      },
    },
  });
};

app.get("/pages/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const result = await getNotionPageInfo(pageId);
  const bookName = result.properties["이름"].title[0].text.content;
  const memberName = result.properties["멤버(이메일)"].people[0].name;
  const memberEmail = result.properties["멤버(이메일)"].people[0].person.email;

  // // const testStr = `(${memberEmail}에게 ${applicantEmail})가 (여긴 내 이메일로?) | ${applicantName}님이 ${bookName} 책의 대여를 신청하셨습니다. 해당 페이지 바로가기 ${pageUrl}`;

  res.render("hello", {
    pageId,
    bookName,
    memberName,
    memberEmail,
  });
});

app.post("/form/:pageId", async (req, res) => {
  const { pageId } = req.params;
  await updateNotionPage(pageId);
  res.status(200).send("신청완료");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
