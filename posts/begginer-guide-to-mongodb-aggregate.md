---
tags: ["database", "mongodb"]
title: "Beginner Guide on MongoDB .aggregate()"
description: "A story driven approach to mongodb aggregate"
date: 2019-05-19
---

This is a beginner-to-beginner guide to MongoDB’s aggregate pipeline: you will turn raw chat documents into filtered, reshaped, and paginated results with `$match`, `$project`, `$unwind`, `$group`, and `$facet`.

I have worked with MongoDB for a while, and I love its query syntax. It confuses you at first, it looks like this:

```text
  {% raw %} 
  .aggregate([{{{{{{{{ }}}}}}}}}]) // give yourself space
  {% endraw %}
```

We will learn how to use `$facet`, `$match`, `$unwind`, `$project`, and `$group`. Let us provide some data first:

```json
  {% raw %}
  // Chat schema example
  {
      "_id" : ObjectId("5d1449db6f934a2926c175d1"),
      "clients" : ["rooberduck@mail.com",
                   "sillybilly@mail.com"],
      "roomId" : 1,
      "message" : [{
              "time" : ISODate("2019-06-27T04:44:49.528Z"),
              "status" : "SEND", "text" : "Hello!",
              "sender" : "sillybilly@mail.com",
              "receiver" : "rooberduck@mail.com",
              "_id" : ObjectId("5d1449db6f934a2926c175d2")
          }, {
              "time" : ISODate("2019-06-27T04:54:49.528Z"),
              "status" : "READ",
              "text" : "Hello Wow Are You?",
              "sender" : "rooberduck@mail.com",
              "receiver" : "sillybilly@mail.com",
              "_id" : ObjectId("5d1449ff6f934a2926c175d3")
          }]
  }
  {% endraw %}
```
### Get the last message for a user with $project

To do this you could use `$match: { clients: "sillybilly@mail.com" }` but to display the last message only, use `$project`.

Here `$project` takes only the fields you request. Working with aggregate is like working with a stream or pipeline, so care for every step.

```js
  {% raw %}
  db.chat.aggregate([
    { $match: { clients: "sillybilly@mail.com" } },
    { $project: {
        _id: "$roomId",
        message: { $slice: ["$message", -1] }
      }
    }
  ])

  // result
  [{
      "_id" : 1,
      "message" : [{
          "time" : ISODate("2019-06-27T04:54:49.528Z"),
          "status" : "SEND",
          "text" : "Hello!",
          "sender" : "sillybilly@mail.com",
          "receiver" : "rooberduck@mail.com",
          "_id" : ObjectId("5d1449ff6f934a2926c175d3")
      }]
  }]
  {% endraw %}
```

So `$project` takes the previous result and projects it. You can reference the previous value with “$” as long as it matches the result field.

“Ewww but how come that data are okay? You only had one message, why do you need an array? I do not need that! And why should I go to the `message` field, take array [0], and get sender,” said a wholesome frontend developer.

### Extract the chat partner with $unwind

Assume that you select sillybilly as the sender, the one that uses your application, and other users in the **clients array** are the others. `$unwind` to the rescue.

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" }
  ])
{% endraw %}
```
The result of that query gives you deconstructed array elements of matching documents.

```js
{% raw %}
  [{ foo: [bar, baz] }] // without $unwind
  [{ foo: bar }, {foo: baz}] // with $unwind on $foo
  // every document is now decoupled
{% endraw %}
```

Now you can get the receiver name:

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $project: {
        _id: "$roomId", receiver: "$clients",
        message: { $slice: ["$message", -1] }
      }}
  ])
  // result: { _id: 1, receiver: "rooberduck@mail.com",
  //   message: [{ text: "Hello!", status: "SEND" }] }
{% endraw %}
```
Nice, now send a message to the frontend developer again. But hold on, you see the design again, it has an unread message badge, you should count it. You sit down again and start thinking.

### Count unread messages with $group

Do you feel the syntax already? :V

You already unwound `clients`, should you `$unwind` `messages` again? Yes. It is like working with a stream, so follow the pattern you created.

Since using `$sum` in `$project` requires a lot of `$cond`, you can simplify your query with `$group`. `$group` has many [accumulator](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulator-operator) operators that help, for example `$last` and `$first`.

```js
  // unwind it again
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $unwind: "$message" },
      { $match: { "message.status": 'SEND' } },
      { $group: {
        _id: '$_id',
        roomId: { $first: '$roomId' },
        receiver: { $first: '$clients' },
        unread: { $sum: 1 },
        message: { $last: '$message.text' },
        time: { $last: '$message.time' }
      }}
  ])

  // result
  [{
      "_id" : ObjectId("5d1449ff6f934a2926c175d3"),
      "receiver" : "rooberduck@mail.com",
      "unread": 1,
      "message" : "Hello!",
      "time": ISODate("2019-06-27T04:54:49.528Z")
  }]
```

> I think this query does not perform well, imagine you have 1000 messages, you will unwind 1000 messages, that can affect performance. Comment below if you know a better way 😁

So now you have a clean response from your database, the only thing missing from the UI design is pagination!

### Paginate results with $facet

The docs about `$facet` say: “Processes multiple aggregation pipelines within a single stage on the same set of input documents”.

That means you can use aggregation inside `$facet` like `$unwind`. But you do not need to unwind again, to paginate with `$facet` you can use this query:

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $unwind: "$message" },
      { $match: { "message.status": 'SEND' } },
      { $group: {
          _id: '$_id', roomId: { $first: '$roomId' },
          receiver: { $first: '$clients' },
          unread: { $sum: 1 },
          message: { $last: '$message.text' },
          time: { $last: '$message.time' }
        }},
      { $facet: {
          metadata: [{ $count: 'total' },
            { $addFields: { page: 1 } }],
          data: [{ $skip: 0 }, { $limit: 15 }]
        }}
    ])
  // result: { metadata: [{ total: 1, page: 1 }],
  //   data: [{ receiver: "rooberduck@mail.com",
  //     unread: 1, message: "Hello!" }] }
{% endraw %}
```
That is it, you have your API response ready, now you tell the frontend dev you finished, and they accept your API response.

See you next post, and have an awesome day :)

Feedback always welcome.
