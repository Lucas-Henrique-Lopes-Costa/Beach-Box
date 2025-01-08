from sqlalchemy import create_engine
import pandas as pd

class Config:

    def __init__(self):
        self.__host = "caustically-adroit-bug.data-1.use1.tembo.io"
        self.__port = "5432"
        self.__user = "postgres"
        self.__password = "SRorljwFz94osiKz"
        self.__database = "postgres" 

    def conectar_bd(self):
        connection_string = f"postgresql+psycopg2://{self.__user}:{self.__password}@{self.__host}:{self.__port}/{self.__database}"
        engine = create_engine(connection_string)
        return engine