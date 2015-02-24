# Installation Notes for Setting up Debian Server with the worldmapmaker.com system.

This will mean very little for anyone except me. Migrating a AWS installation to DigitalOcean.

Commands - failed ones and info ones - removed.

   21  sudo apt-get install mysql-server56
   24  sudo pt-get install git
   32  git clone git@github.com:aliwatters/travelblog.git
   50  sudo mkdir /home/www_data
   59  sudo mkdir /home/www_data/worldmapmaker.com
   60  sudo mkdir /home/www_data/worldmapmaker.com/_cache
   61  sudo mkdir /home/www_data/worldmapmaker.com/_logs
   62  sudo chown www-data.www-data /home/www_data/ -R
   71  sudo mkdir /home/www
   72  sudo chown ali.ali /home/www/ -R
   73  cd /home/www
   75  ln -s /home/ali/git/travelblog/worldmapmaker .
   81  sudo apt-get update
   82  sudo apt-get upgrade
   79  sudo apt-get install nginx
   84  sudo apt-get remove varnish
   85  sudo /etc/init.d/nginx restart
   90  sudo ln -s /home/ali/git/travelblog/worldmapmaker/server-config/worldmapmaker.com .
   92  sudo /etc/init.d/nginx restart 
   97  sudo apt-get install php5

// my droplet image has varnish - conflicts with nginx remove.

  101  sudo unlink S01varnish  S01varnishlog S01varnishncsa S02apache2
  102  sudo unlink S01varnish  
  103  sudo unlink S01varnishlog  
  104  sudo unlink S01varnishncsa 
  105  sudo unlink S02apache2 
  108  sudo ln -s ../init.d/apache2 K02apache2 
  111  sudo apt-get install php5-fpm
  124  sudo unlink default 
  127  sudo ln -s ../sites-available/worldmapmaker.com .
  128  sudo /etc/init.d/nginx restart
  131  sudo ln -s /home/ali/git/travelblog/server-config/php.conf .
  132  sudo /etc/init.d/nginx restart
  135  cd /home/www
  137  ln -s /home/ali/git .
  138  sudo /etc/init.d/nginx restart
  152  sudo /etc/init.d/php5-fpm restart
  157  cd /etc/php5/fpm/
  159  cd pool.d/
  162  sudo mv www.conf www.bak
  163  sudo ln -s /home/ali/git/travelblog/server-config/pool.d.www.conf www.conf
  164  sudo /etc/init.d/php5-fpm restart

  167  sudo apt-get install build-essential
  168  sudo apt-get install php-pear
  171  sudo apt-get install php5-dev
  172  sudo pecl install bbcode-1.0.3b1

// Note: could have cloned the .so from another system,

  174  sudo vi /etc/php5/fpm/php.ini 
  175  sudo /etc/init.d/php5-fpm restart
  177  sudo apt-get install php5-mysql


// Note: lots of this could be reordered and simplified.

TODO -- get copy of DB from AWS

On AWS

sudo mysqldump worldmapmaker -h127.0.0.1 > ~/wmm-2014.sql
// Then stop mysql -- down time starts here!

scp wmm-2014.sql.gz ali@162.243.83.249:~/.

// on new server.

mysql> create database worldmapmaker;
Query OK, 1 row affected (0.00 sec)

mysql> GRANT INSERT,DELETE,UPDATE,SELECT ON worldmapmaker.* TO 'wmm_user'@'localhost' IDENTIFIED BY 'XXX' WITH GRANT OPTION;
Query OK, 0 rows affected (0.00 sec)

mysql> GRANT ALL PRIVILEGES ON worldmapmaker.* TO 'wmm_admin'@'localhost' IDENTIFIED BY 'XXX' WITH GRANT OPTION;
Query OK, 0 rows affected (0.00 sec)

// Make DNS update -- OH GOOD Grief -- moniker.com argh.


