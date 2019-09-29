module.exports = {
    database: {
        name: 'mirthDB',
        user: 'postgres',
        password: 'root',
        port: 5432,
        host: 'localhost'
    },
    /*mirth: {
        url: 'https://localhost:8443/',
        user: 'ismail',
        password: 'ismail'
    }*/
    mirth: {
        url: 'https://app-15086.on-aptible.com/api/',
        user: 'admin',
        password: 'Ekare123@'
    },
    mailer: {
        emailFrom: 'testmasarta@gmail.com',
        password: "testmirth",
        emailTo: 'testmasarta@gmail.com'
    }
};