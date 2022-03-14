module.exports = {
    apps: [{
        script: 'bin/www',
        watch: '.'
    }, {
        script: './service-worker/',
        watch: ['./service-worker']
    }],

    deploy: {
        production: {
            user: 'root',
            host: 'a9e45ea.online-server.cloud',
            ref: 'origin/master',
            repo: 'https://github.com/ErickTraore/kemetbackend.git ikcadci.eu',
            path: '/var/www/html',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};