1. Create an `.env` file or otherwise inject values.
   ```bash
   MATERIALIZE_USERNAME="********"
   MATERIALIZE_PASSWORD="********"
   MATERIALIZE_HOST="********"
   MATERIALIZE_DATABASE="********"
   MATERIALIZE_QUERY="SELECT * FROM some_biggish_table"
   ```
   My test query selected data from a table with some 2,040 rows.
   The key is that the result set is larger than the `pg-query-stream`
   batch size.
2. Run `./index.js`. The _first_ batch will be successfully
   retrieved, but the stream/cursor will hang indefinitely after this.