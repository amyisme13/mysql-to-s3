# mysql-to-s3

A cli app to run mysqldump and store it into s3

## Prerequisite

- Setup your aws credentials & config like in [this guide](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html#getting-started-nodejs-credentials)
- Install mysql cli tools, specifically **mysqldump**

## Install

Install this package globally using your preferred package manager

```bash
npm install -g mysql-to-s3
```

or

```bash
yarn global add mysql-to-s3
```

## Usage

Add a mysql instance to be backed up

```bash
mysql-to-s3 add
```

Remove instance that you dont want to backup

```bash
mysql-to-s3 remove
```

List instances

```bash
mysql-to-s3 instances
```

List backups that have been created

```bash
mysql-to-s3 list
```

Create backup of the instances you added before

```bash
mysql-to-s3 run --bucket <bucket name>
```

## Misc

To change tmp dir, you can set it in MYSQL_TO_S3_TMP environment variable.

```bash
MYSQL_TO_S3_TMP=/path/to/other/dir
```
