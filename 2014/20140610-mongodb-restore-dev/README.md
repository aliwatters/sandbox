# Resizing mongodb database.

Notes: MongoDB 2.4.10

## use only on development environments

1) mongodb will allocate 2.0GB files in your database - rapidly exceeding a dev env's disk space
2) in order reduce the size of the files - you need to set option --smallfiles in /etc/mongodb.conf (mongodb config file)
3) in order to reduce the size of existing mongodb files you need to run repair with --smallfiles set
4) note: disable journaling --nojournal - to avoid complaints about subdirectories of dbpath required

Repair command looks like this:

```
$ mongod --dbpath /<src_mongo_data> --repairpath /<dst_mongo_data> --smallfiles --nojournal
```

