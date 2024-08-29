import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS packages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      link TEXT NOT NULL,
      description TEXT,
      version TEXT,
      published_ago TEXT,
      publisher TEXT,
      license TEXT,
      compatibility TEXT,
      scores JSONB,
      pub_tag_badges JSONB
    );
  `;

  const insertDataQuery = `
    INSERT INTO packages (name, link, description, version, published_ago, publisher, license, compatibility, scores, pub_tag_badges)
    VALUES
    (
      'cupertino_icons',
      'https://pub.dev/packages/cupertino_icons',
      'Default icons asset for Cupertino widgets based on Apple styled icons',
      '1.0.8',
      '4 months ago',
      'flutter.dev',
      'flutter.dev',
      'Dart 3 compatible',
      '{"likes": "829", "pubPoints": "150", "popularity": "100"}'::jsonb,
      '[{"mainTag":"SDK","subTags":["Flutter"]},{"mainTag":"Platform","subTags":["Android","iOS","Linux","macOS","web","Windows"]}]'::jsonb
    ),
    (
      'intl',
      'https://pub.dev/packages/intl',
      'Contains code to deal with internationalized/localized messages, date and number formatting and parsing, bi-directional text, and other internationalization issues.',
      '0.19.0',
      '8 months ago',
      'dart.dev',
      'dart.dev',
      'Flutter FavoriteDart 3 compatible',
      '{"likes": "5382", "pubPoints": "140", "popularity": "100"}'::jsonb,
      '[{"mainTag":"SDK","subTags":["Dart","Flutter"]},{"mainTag":"Platform","subTags":["Android","iOS","Linux","macOS","web","Windows"]}]'::jsonb
    );
  `;

  try {
    await sql.unsafe(createTableQuery);
    await sql.unsafe(insertDataQuery);
    res
      .status(200)
      .json({ message: "Table created and data inserted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating table or inserting data" });
  }
}
