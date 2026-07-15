#
# Jekyll generator that exposes Git metadata
#
# This plugin contains work from:
#   https://github.com/yegor256/jekyll-git-hash/blob/19722f2/lib/jekyll-git-hash.rb
#
# USAGE
#   {{ site.git.latest_commit }}
#   {{ site.git.short_commit }}
#   {{ site.git.commit_date }}
#

module Jekyll
  class GitMetadata < Generator
    priority :highest

    VERSION = '1.0.1'.freeze

    def generate(site)
      site.config['git'] = {}

      site.config['git']['latest_commit'] = `git rev-parse HEAD`.strip
      site.config['git']['short_commit']  = `git rev-parse --short HEAD`.strip
      site.config['git']['commit_date']   = `git log -1 --date=iso-strict --format=%cd`.strip
    end
  end
end

Jekyll.logger.info 'Plugin:', "#{File.basename(__FILE__)} #{Jekyll::GitMetadata::VERSION} loaded."
