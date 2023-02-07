function insert_query(table, tablename) {
  const rows = table.split('\n');
  const columns = "(" + rows[1].split('|')
    .map(word => word.trim())
    .filter(word => word != "")
    .join(', ') + ")";
  const data = rows.filter((row, idx) => idx > 2 && idx < rows.length - 1)
    .map(row => {
      const words = row.split("|")
        .map(word => word.trim());
      return "('" + words
        .filter((word, idx) => idx > 0 && idx < words.length - 1)
        .map(word => word.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
          switch (char) {
            case "\0":
              return "\\0";
            case "\x08":
              return "\\b";
            case "\x09":
              return "\\t";
            case "\x1a":
              return "\\z";
            case "\n":
              return "\\n";
            case "\r":
              return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
              return "\\" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
            default:
              return char;
          }
        }))
        .join("', '") + "')";
    })
    .join(",\n");
  const query = `INSERT INTO ${tablename} ${columns}\nVALUES ${data};`;
  return query;
}

$(() => {
  $('.generate-insert').each(function () {
    const thisObj = $(this);
    const insQuery = insert_query(thisObj.text(), thisObj.data('tablename'));
    const div = $('<div>')
      .insertAfter(thisObj.parents('pre'));
    $('<p>')
      .html("<strong>Requête d'insertion</strong>")
      .appendTo(div);
    $('<pre>')
      .text(insQuery)
      .appendTo(div);
  });
});