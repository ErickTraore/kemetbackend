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
            host: '212.227.142.69',
            ref: 'origin/master',
            repo: 'http://github.com/ErickTraore/kemetbackend.git',
            path: '/var/www/html/ikcadci.eu',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};