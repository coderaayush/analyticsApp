(function() {
  app.controller('dialogcontroller', dialogcontroller);

  function dialogcontroller($scope, $mdDialog, player, moment) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };

    player.sachinData().then(function(response) {
      var allRecords = response.data;
      var stats = getStats(allRecords);

      $scope.matchesPlayed = stats.matchesPlayed;
      $scope.totalRuns = stats.battingScore;
      $scope.firstDate = stats.firstDate;
      $scope.lastDate = stats.lastDate;
      var spanYears = moment(stats.lastDate).diff(moment(stats.firstDate), 'years', true);
      var spanDays = (spanYears + "").split(".");
      spanDays = spanDays[1] / 100;
      spanDays = 365 * spanDays;
      $scope.spanYears = Math.floor(spanYears);
      $scope.spanDays = Math.floor(spanDays);

      $scope.centuryCount = stats.centuryCount;
      $scope.halfCenturyCount = stats.halfCenturyCount;
      $scope.wicketsCount = stats.wicketsCount;
      $scope.uniqGroundsCount = stats.uniqGroundsCount;

      var fiftyAbvFirst = _.size(_.filter(allRecords, function(o) {
        return o.batting_score >= 50 && o.batting_innings == '1st';
      }));
      var fiftyChaseWinCount = _.size(_.filter(allRecords, function(o) {
        return o.batting_score >= 50 && o.batting_innings == '2nd' && o.match_result == 'won';
      }));
      var thirtyLessChaseLossCount = _.size(_.filter(allRecords, function(o) {
        return o.batting_score < 30 && o.batting_innings == '2nd' && o.match_result == 'lost';
      }));

      var thirtyfiveAbvWin = _.size(_.filter(allRecords, function(o) {
        return o.batting_score >= 35 && o.match_result == 'won';
      }));
      var winCount = _.size(_.filter(allRecords, function(o) {
        return o.match_result == 'won';
      }));
      var winChaseCount = _.size(_.filter(allRecords, function(o) {
        return o.match_result == 'won' && o.batting_innings == '2nd';
      }));


      $scope.fiftyChaseWinCount = fiftyChaseWinCount;
      $scope.thirtyLessChaseLossCount = thirtyLessChaseLossCount;
      $scope.winChaseCount = winChaseCount;

      $scope.thirtyfiveAbvWin = thirtyfiveAbvWin;
      $scope.winCount = winCount;
    });

  }

  function getStats(data) {
    var statsData = {};
    var scoreArr = [];
    var dateArr = [];
    var wicketsArr = [];
    var groundArr = [];
    var notOutCount = 0;
    var centuryCount = 0,
      halfCenturyCount = 0;
    var winCount = 0;
    _.forEach(data, function(stats) {
      _.forEach(stats, function(value, key) {
        if (key === 'batting_score') {

          //Not Out or Not Played count for Avg Calculation
          if (value.indexOf('DNB') > -1 || value.indexOf('*') > -1) {
            notOutCount = notOutCount + 1;
          }

          // Handling * DNB string type for score calculation
          value = parseInt(value);
          value = value || 0;
          scoreArr.push(value);

          //Centuries Count
          if (value >= 100) {
            centuryCount = centuryCount + 1;
          }
          if (value >= 50 && value < 100) {
            halfCenturyCount = halfCenturyCount + 1;
          }
        }

        if (key === 'match_result') {
          if (value === 'won') {
            winCount = winCount + 1;
          }
        }

        if (key === 'date') {
          dateArr.push(Date.parse(value));
        }

        if (key === 'ground') {
          groundArr.push(value);
        }

        if (key === 'wickets') {
          if (!_.isUndefined(value) && !_.isEmpty(value)) {
            value = parseInt(value);
            value = value || 0;
            wicketsArr.push(value);
          }
        }
      });
    });

    statsData.battingScore = _.sum(scoreArr);
    statsData.matchesPlayed = _.size(data);
    statsData.centuryCount = centuryCount;
    statsData.halfCenturyCount = halfCenturyCount;
    statsData.winCount = winCount;
    statsData.avg = statsData.battingScore / (statsData.matchesPlayed - notOutCount);
    statsData.firstDate = _.min(dateArr);
    statsData.lastDate = _.max(dateArr);
    statsData.uniqGroundsCount = _.size(_.uniq(groundArr));
    statsData.wicketsCount = _.sum(wicketsArr);
    return statsData;
  }


})();