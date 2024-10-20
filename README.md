
## Install

1. Clone the repository:
    ```sh
    git clone <URL_DEL_REPOSITORIO>
    ```
2. Install dependencies:
    ```sh
    yarn install
    ```
3. Make the .en file:
  
    Clone de .Env Template
    

4. Execute the docker file:
    ```sh
    docker compose up -d
    ```
4. For Login use the default username and password:
    ```sh
    user: test@seed.com
    password: Password123
    ```



## Use App

### Start Aplication Dev Mode

To start aplication run:

```sh
yarn start:dev
```
To start Tests run:

```sh
yarn test:wartch
```

```env
#======Mains=========
PORT=3005
JWT_SECRET=3stEe$m1Jw7S3cr37
ACCES_STOKEN_EXPIRE=1h

#======Firebase=========
APY_KEY=AIzaSyAF5st_cFCPyRo04BwnXzbRdouE4HSvOyA
AUTH_DOMAIN=app-demo-3875e.firebaseapp.com
PROJECT_ID=app-demo-3875e
STORAGE_BUCKET=app-demo-3875e.appspot.com
MESSAGING_SENDER_ID=613245479305
APP_ID=1:613245479305:web:dc3d8999f0c2c5c43fd958
MEASUREMENT_ID=G-4YVKNXLL6K

#======Redis=========
REDIS_HOST="redis-axis-leonardglez12485.k.aivencloud.com"
REDIS_PORT=10886
REDIS_PASSWORD=AVNS_I6Q7DglY3Eg6l_DJHdf

#======Postgres DB========
USER_NAME=postgres
PASSWORD=postgres
DATABASE=postgres