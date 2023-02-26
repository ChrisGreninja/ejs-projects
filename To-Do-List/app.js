const express = require("express");
const bodyParser = require("body-parser");
// const request = require("request");
const mongoose = require("mongoose");
const _= require("lodash");
/////////////////////////////////////
const app = express();
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

////////////////////////////////////
mongoose.set("strictQuery", false);
mongoose.connect("/////// ADD MONGODB ATLAS LINK OR CONNECT TO LOCALHOST /////////", function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to mongodb");
  }
});

const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist",
});
const item2 = new Item({
  name: "Hit + to add item",
});


const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
const List = mongoose.model("list", listSchema);

////////////////////////

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("success");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { ListTitle: "Today", newListItem: foundItems });
      }
    }
  });
});

////////
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if(listName ==="Today"){
    item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
    
  }
  // if (req.body.list === "Work") {
  //   workItems.push(Item);
  //   res.redirect("/work");
  // } else {
  //   Items.push(Item);
  //   res.redirect("/");
  // }
});
////////////////////
app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName ==="Today"){
  Item.findByIdAndRemove(checkItemId, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("deleted");
    }
    res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })

  }
});

////////////////
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, async function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          ListTitle: foundList.name,
          newListItem: foundList.items,
        });
      }
    }
  });
});

///////
app.listen(3000, function () {
  console.log("runs");
});
//
