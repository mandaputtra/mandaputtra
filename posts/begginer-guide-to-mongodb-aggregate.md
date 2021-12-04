---
tags: ["database", "mongodb"]
title: "Beginner Guide on MongoDB .aggregate()"
description: "A story driven approach to mongodb aggregate"
date: 2019-05-19
---

This article was my journey on NoSQL database lately this year, so this was from beginner to beginner guide.

MongoDB or NoSQL had been trending, but I still love SQL databases for some reason. However, MongoDB had a great Query Syntax (Despite on performance, etc.) that I admit I falling in love with that. I've been work with MongoDB quite sometimes now, and I want to share some tips on using aggregate! The powerful feature in MongoDB.

Oh yeah, you will be quite confused with the syntax, it looks like this :

```text
  {% raw %} 
  .aggregate([{{{{{{{{ }}}}}}}}}]) // I love aggregate, better use your space and get ready"
  {% endraw %}
```

We will learn how to use `$facet`, `$match`, `$unwind`, `$project`, and `$group`. Lest provide some data here first :

```json
  {% raw %}
  // Just a simple chat schema here for a real-world example
  // RoomID for chat room since it chatting room
  // Clients contains all clients on a room ~
  {
      "_id" : ObjectId("5d1449db6f934a2926c175d1"),
      "clients" : [
          "rooberduck@mail.com",
          "sillybilly@mail.com"
      ],
      "roomId" : 1,
      "message" : [
          {
              "time" : ISODate("2019-06-27T04:44:49.528Z"),
              "status" : "SEND",
              "text" : "Hello!",
              "sender" : "sillybilly@mail.com",
              "receiver" : "rooberduck@mail.com",
              "_id" : ObjectId("5d1449db6f934a2926c175d2")
          },
          {
              "time" : ISODate("2019-06-27T04:54:49.528Z"),
              "status" : "READ",
              "text" : "Hello Wow Are You?",
              "sender" : "rooberduck@mail.com",
              "receiver" : "sillybilly@mail.com",
              "_id" : ObjectId("5d1449ff6f934a2926c175d3")
          }
      ],
      "__v" : 0
    ....
  }
  {% endraw %}
```
### 1st case : get all message from one user and return his last message

Okay in order to do this you could use `$match: { clients: "sillybilly@mail.com" }` but how to display the last message only, you could use `$project`

In here project only takes what your requested field are, working with aggregate it is like working with *stream* or *pipeline*, you should care for every step of it.

```js
  {% raw %}

  db.chat.aggregate([
    { $match: { clients: "sillybilly@mail.com" } },
    { $project: { _id: "$roomId", message: { $slice: ["$message", -1] } } }
  ])

  // result
  [{
      "_id" : 1,
      "message" : [
          {
              "time" : ISODate("2019-06-27T04:54:49.528Z"),
              "status" : "SEND",
              "text" : "Hello!",
              "sender" : "sillybilly@mail.com",
              "receiver" : "rooberduck@mail.com",
              "_id" : ObjectId("5d1449ff6f934a2926c175d3")
          }
      ]
  }, ... more other result ]
  
  {% endraw %}

```

so `$project` takes field or result on previous result and project it, you can get the previous value of result by using "$" as long it matches the resulted field's.

"Ewww but how come that data are okay? you only had one message, why do you need an array? I don't need that! and why I should go to the `message` field takes array [0] and get sender" - a wholesome frontend developer.

### 2nd case: get what that frontend developer wants

Assume that you just select sillybilly as the sender, the one that uses your application, and other users that on **clients array** are other. `$unwind` to the rescue.

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" }
  ])
{% endraw %}
```
the result of that queries will give you deconstructed array element of matchning documents.

```js
{% raw %}
  [{ foo: [bar, baz] }] // not using unwind
  [{ foo: bar }, {foo: baz}] // using unwind $foo
  // get that? so now every documents are decoupled
{% endraw %}
```

Okay then we can now get the receiver name :

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $project: {
        _id: "$roomId",
        receiver: "$clients",
        message: { $slice: ["$message", -1]
        }
      }}
  ])

  // result

  [{
      "_id" : 1,
      "receiver" : "rooberduck@mail.com",
      "message" : [
          {
              "time" : ISODate("2019-06-27T04:54:49.528Z"),
              "status" : "SEND",
              "text" : "Hello!",
              "sender" : "sillybilly@mail.com",
              "reciever" : "rooberduck@mail.com",
              "_id" : ObjectId("5d1449ff6f934a2926c175d3")
          }
      ]
  } ... another result]
{% endraw %}
```
Okay nice now send a message to the frontend developer again. But hold on you see the design again it got unread message badge... you should count it. Hmmm. You sit down again and thingking..

### 3rd case: count unread message inside an array of messages object

Do you feel it the syntax of already? :V

You already `$unwind` the clients, should you `$unwind` again the messages? Yes. It is like working with the stream so you should follow the pattern you create.

Since using `$sum` in `$project` requires a lot of `$cond` you can simplify your query using `$group`. `$group` had a lot of [accumulator](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulator-operator) operator that can be useful, for detecting the `$last` / `$first` element.

```js
  //  unwind it again
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $unwind: "$message" }, // messages decoupled her
      { $match: "$message.status": 'SEND' }
      { $group: {
        _id: '$_id', // we group it by _id
        roomId: { $first: '$roomId' }, // accumulator must be used otherwise error will thrown
        receiver: { $first: '$clients' },
        unread: { $sum: 1 },
        message: { $last: '$message.text' },
        time: { $last: '$message.time' }
      }
    }
  ])

  // result
  [{
      "_id" : ObjectId("5d1449ff6f934a2926c175d3"),
      "receiver" : "rooberduck@mail.com",
      "unread": 1,
      "message" : "Hello!",
      "time": ISODate("2019-06-27T04:54:49.528Z")
  }... another result]
```

> I think this query isn't performing well, imagine if you had 1000 messages, you will unwind 1000 message, that can affect performance? Comment below if you know the best way 😁

So now you got a beautiful response from your database, the only thing you missing from the design UI is pagination!

### 4th case : paginate .aggregate() using $facet

The docs about `$facet` say something like this: "Processes multiple aggregation pipelines within a single stage on the same set of input documents".

That means that we can use aggregation inside `$facet` like `$unwind`. But we don't need to unwind again, to do your pagination via `$facet` you could just use this query :

```js
{% raw %}
  db.getCollection('chats').aggregate([
      { $match: { clients: "sillybilly@mail.com" } },
      { $unwind: "$clients" },
      { $match: { clients: { $ne: 'sillybilly@mail.com' } } },
      { $unwind: "$message" },
      { $match: "$message.status": 'SEND' }
      { $group: {
          _id: '$_id',
          roomId: { $first: '$roomId' },
          receiver: { $first: '$clients' },
          unread: { $sum: 1 },
          message: { $last: '$message.text' },
          time: { $last: '$message.time' }
        }
      },
      {
        $facet: {
            metadata: [{ $count: 'total' }, { $addFields: { page: 1 } }],
            data: [
              { $skip: 0 },
              { $limit: 15 }
            ]
          }
      }
    ])

  // result: now you got a paginated response
  [{
      "metadata": [ { $count: 'total' }, { page: 1 } ],
      "data": [
        {
          "_id" : ObjectId("5d1449ff6f934a2926c175d3"),
          "receiver" : "rooberduck@mail.com",
          "unread": 1,
          "message" : "Hello!",
          "time": ISODate("2019-06-27T04:54:49.528Z")
        }
      ]
  }... another result]
{% endraw %}
```
That's it you got your beautiful response API, now you come the frontend dev and say, you got it done, and the he/she accept your API response.

See you next post, and had an awesome day :)

Feedback always welcome.
