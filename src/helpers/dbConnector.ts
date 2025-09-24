import sql, { config } from "mssql";

export class DbConnector {
  private static instance: DbConnector;
  private dbConnection: Promise<sql.ConnectionPool>;
  private sqlConfig: config = {
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.SERVER!,
    options: {
      trustServerCertificate: true,
    },
  };

  private constructor() {
    this.dbConnection = this.createConnection();
  }

  public static getInstance(): DbConnector {
    if (!DbConnector.instance) {
      DbConnector.instance = new DbConnector();
    }
    return DbConnector.instance;
  }

  private async createConnection(): Promise<sql.ConnectionPool> {
    return sql.connect(this.sqlConfig);
  }

  public get connection(): Promise<sql.ConnectionPool> {
    return this.dbConnection;
  }
}
