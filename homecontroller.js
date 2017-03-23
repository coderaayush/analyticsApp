(function() {
  app.controller('homecontroller', homecontroller);

  function homecontroller($scope, $timeout, player, $mdDialog, moment) {
    var hm = this;

    // Sample data for pie chart
    hm.showgraph = false;
    hm.chartConfig = {
      chart: {
        type: 'line',
        width: 700,
      },
      xAxis: {
        title: {
          text: 'Match'
        }
      },
      yAxis: {
        title: {
          text: 'Score',
        }
      },
      series: [],
      title: {
        text: 'Score Performance',
      },
      tooltip: {
        formatter: function() {
          return 'Runs : ' + this.point.y + '<br>Date : <b>' + this.point.dateInfo + '</b>';
        }
      },
    };

    hm.pieChartConfig = {
      chart: {
        type: 'pie',
        width: 600,
      },
      series: [],
      title: {
        text: 'Match Result',
      },
      tooltip: {
        formatter: function() {
          return 'Number of matches : <b>' + this.point.y + '</b>';
        }
      },
    };

    hm.career = 'all';
    hm.opposition = 'all';

    hm.showFactsDialog = function(ev) {
      $mdDialog.show({
          controller: 'dialogcontroller',
          templateUrl: 'dialog.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          hm.status = 'You said the information was "' + answer + '".';
        }, function() {
          hm.status = 'You cancelled the dialog.';
        });
    };

    player.sachinData().then(function(response) {
      hm.allRecords = response.data;

      var scoreArr = [];
      var domesticRecord = [];
      var domesticScore = [];
      var internationalRecord = [];
      var centuryCount = 0,
        halfCenturyCount = 0,
        notOutCount = 0,
        winCount = 0;
      var oppositionTeam = [];

      _.forEach(response.data, function(stats) {
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

          //Ground Check
          if (key === 'ground') {
            if (isDomesticPitch(value)) {
              domesticRecord.push(stats);
            } else {
              internationalRecord.push(stats);
            }
          }

          //Opposition Check
          if (key === 'opposition') {
            oppositionTeam.push(_.replace(value, 'v ', ''));
          }

          //Wins Count
          if (key === 'match_result') {
            if (value === 'won') {
              winCount = winCount + 1;
            }
          }

        });
      });

      hm.domesticRecords = domesticRecord;
      hm.internationalRecords = internationalRecord;

      hm.battingScore = _.sum(scoreArr);
      hm.matchesPlayed = _.size(response.data);
      hm.centuryCount = centuryCount;
      hm.halfCenturyCount = halfCenturyCount;
      hm.avg = hm.battingScore / (hm.matchesPlayed - notOutCount);
      hm.oppositionTeam = _.uniq(oppositionTeam);
      hm.winsPercentage = ((winCount / hm.matchesPlayed) * 100);

      hm.showgraph = true;
      hm.chartConfig.series.push({
        data: getScoreWithDateTime(hm.allRecords, hm.opposition),
        name: 'Sachin'
      });

      hm.pieChartConfig.series.push({
        data: getWinsLossDetails(hm.allRecords, hm.opposition),
        name: 'Sachin'
      });

    });

    hm.switchCareerRecord = function(career) {

      var data;
      hm.career = career;
      if (career === 'domestic') {
        data = hm.domesticRecords;
      } else if (career === 'international') {
        data = hm.internationalRecords;
      } else {
        data = hm.allRecords;
      }

      //switch graph data
      hm.chartConfig.series.push({
        data: getScoreWithDateTime(data, hm.opposition),
        name: 'Sachin'
      });

      hm.pieChartConfig.series.push({
        data: getWinsLossDetails(data, hm.opposition),
        name: 'Sachin'
      });

      //update stats
      var statsData = getStats(data, hm.opposition);

      hm.battingScore = statsData.battingScore;
      hm.matchesPlayed = statsData.matchesPlayed;
      hm.centuryCount = statsData.centuryCount;
      hm.halfCenturyCount = statsData.halfCenturyCount;
      hm.avg = statsData.avg;
      hm.winsPercentage = ((statsData.winCount / hm.matchesPlayed) * 100);

    };

    hm.filterOppositionData = function(opposition) {
      var data, career;
      hm.opposition = opposition;
      career = hm.career;

      if (career === 'domestic') {
        data = hm.domesticRecords;
      } else if (career === 'international') {
        data = hm.internationalRecords;
      } else {
        data = hm.allRecords;
      }

      //switch graph data
      hm.chartConfig.series.push({
        data: getScoreWithDateTime(data, hm.opposition),
        name: 'Sachin'
      });

      hm.pieChartConfig.series.push({
        data: getWinsLossDetails(data, hm.opposition),
        name: 'Sachin'
      });

      //update stats
      var statsData = getStats(data, hm.opposition);

      hm.battingScore = statsData.battingScore;
      hm.matchesPlayed = statsData.matchesPlayed;
      hm.centuryCount = statsData.centuryCount;
      hm.halfCenturyCount = statsData.halfCenturyCount;
      hm.avg = statsData.avg;
      hm.winsPercentage = ((statsData.winCount / hm.matchesPlayed) * 100);
    }
  }

  //domestic pitch
  function isDomesticPitch(currentGround) {
    var domesticPitch = ['Pune', 'Margao', 'Chandigarh', 'Cuttack', 'Kolkata', 'Gwalior',
      'New Delhi', 'Jaipur', 'Jamshedpur', 'Faridabad', 'Guwahati', 'Kanpur', 'Indore', 'Mohali',
      'Rajkot', 'Hyderabad (Deccan)', 'Jalandhar', 'Mumbai', 'Chennai', 'Vadodara', 'Delhi',
      'Visakhapatnam', 'Amritsar', 'Mumbai (BS)', 'Hyderabad (Sind)', 'Kochi', 'Jodhpur', 'Bangalore',
      'Ahmedabad', 'Nagpur'
    ];

    if (domesticPitch.indexOf(currentGround) > -1) {
      return true;
    } else {
      return false;
    }
  }

  //get Records For Graph

  function getScoreWithDateTime(data, country) {

    if (country != 'all') {
      country = 'v ' + country;
      data = _.filter(data, {
        'opposition': country
      });
    }

    var scoreWithDate = [];
    var counter = 0;

    _.forEach(data, function(stats) {
      var scoreDate = {};
      _.forEach(stats, function(value, key) {
        if (key === 'date') {
          scoreDate.dateInfo = value;
        }
        if (key === 'batting_score') {
          value = parseInt(value);
          value = value || 0;
          counter = counter + 1;
          scoreDate.x = counter;
          scoreDate.y = value;
        }
      });
      scoreWithDate.push(scoreDate);
    });
    return scoreWithDate;
  }

  //get Wins Loss Status For pie Chart

  function getWinsLossDetails(data, country) {
    if (country != 'all') {
      country = 'v ' + country;
      data = _.filter(data, {
        'opposition': country
      });
    }

    var matchResultStats = [];
    var winCount = 0,
      lossCount = 0,
      otherCount = 0;
    _.forEach(data, function(stats) {
      _.forEach(stats, function(value, key) {
        if (key === 'match_result') {
          if (value === 'won') {
            winCount = winCount + 1;
          } else if (value == 'lost') {
            lossCount = lossCount + 1;
          } else {
            otherCount = otherCount + 1;
          }
        }
      });
    });

    var winObj = {},
      lossObj = {},
      otherObj = {};
    winObj.name = 'Wins';
    winObj.y = winCount;

    lossObj.name = 'Losses';
    lossObj.y = lossCount;

    otherObj.name = 'Other (Ties or Not Related)';
    otherObj.y = otherCount;

    matchResultStats.push(winObj, lossObj, otherObj);
    return matchResultStats;
  }

  //get Stats For Display

  function getStats(data, country) {
    if (country != 'all') {
      country = 'v ' + country;
      data = _.filter(data, {
        'opposition': country
      });
    }
    var statsData = {};
    var scoreArr = [];
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
      });
    });

    statsData.battingScore = _.sum(scoreArr);
    statsData.matchesPlayed = _.size(data);
    statsData.centuryCount = centuryCount;
    statsData.halfCenturyCount = halfCenturyCount;
    statsData.winCount = winCount;
    statsData.avg = statsData.battingScore / (statsData.matchesPlayed - notOutCount);
    return statsData;
  }

})();