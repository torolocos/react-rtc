export PATH=$(npm bin):$PATH

VERSION=`auto version`

## Support for label 'skip-release'
if [ ! -z "$VERSION" ]; then
  ## Update Changelog
  ## auto changelog

  ## Publish Package
  npm version $VERSION --workspace=@torolocos/react-rtc
  npm publish --access public --workspace=@torolocos/react-rtc

  # Update dependencies
  yarn workspace example upgrade @torolocos/react-rtc

  ## Create GitHub Release
  ## git push --follow-tags --set-upstream origin $branch
  # auto release
fi
