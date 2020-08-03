const axios = require('axios').default;

exports.main_handler = async (event, context, callback) => {
  let d = new Date();
  let full_date = d.getFullYear().toString() + '-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString()
  console.log(full_date)
  return axios.get('http://service-a786t2ua-1300862921.gz.apigw.tencentcs.com/release/getdeploymentdata', {
    params: {
            /*
            StartTime: '2020-07-23 00:00:00',
            EndTime: '2020-07-23 23:59:59',
            */
            StartTime: `${full_date} 00:00:00`,
            EndTime: `${full_date} 23:59:59`,
          },
  })
  .then(async function (response) {
    let failed_list = response.data.FailedList;
    let success_list = response.data.SuccessList;
    let failed_list_dict = {};
    let success_list_dict = {};
    let error_type_dict = {};

    success_list.forEach(elem => {
      let start_index = elem.content.indexOf('\\') + 2;
      let end_index = elem.content.indexOf('\\', start_index);
      let curr_component = elem.content.substring(start_index, end_index)
      if (!success_list_dict.hasOwnProperty(curr_component)) {
        success_list_dict[curr_component] = 1;
      } else {
        success_list_dict[curr_component] += 1;
      }
    });

    failed_list.forEach(elem => {
      let start_index = elem.content.indexOf('\\') + 2;
      let end_index = elem.content.indexOf('\\', start_index);
      let curr_component = elem.content.substring(start_index, end_index)
      if (!failed_list_dict.hasOwnProperty(curr_component)) {
        failed_list_dict[curr_component] = 1;
      } else {
        failed_list_dict[curr_component] += 1;
      }
      let errorTypeStart = elem.content.indexOf('\\', end_index+3) + 2;
      let errorTypeEnd = elem.content.indexOf('\\', errorTypeStart);
      let curr_error = elem.content.substring(errorTypeStart, errorTypeEnd);
      if (!error_type_dict.hasOwnProperty(curr_error)) {
        error_type_dict[curr_error] = 1;
      } else {
        error_type_dict[curr_error] += 1;
      }
    });

    let total_errors = Object.keys(failed_list).length;
    let total_successes = Object.keys(success_list).length;
    let overall_failure_rate = Math.round(total_errors / (total_errors + total_successes) * 100);
    // Create items array
    let componentErrors = Object.keys(failed_list_dict).map(function(key) {
      return [key, failed_list_dict[key]];
    });
    componentErrors.push(['all', total_errors]);

    // Sort the array based on the second element
    componentErrors.sort(function(first, second) {
      return second[1] - first[1];
    });

    // Create items array
    let componentErrorsType = Object.keys(error_type_dict).map(function(key) {
      return [key, error_type_dict[key]];
    });

    // Sort the array based on the second element
    componentErrorsType.sort(function(first, second) {
      return second[1] - first[1];
    });

    let failure_rate_dict = {};
    let total_deployments_dict = {};

    for (let component in success_list_dict) {
      total_deployments_dict[component] = success_list_dict[component];
    }

    for (let component in failed_list_dict) {
      if (!total_deployments_dict.hasOwnProperty(component)) {
        total_deployments_dict[component] = failed_list_dict[component];
      } else {
        total_deployments_dict[component] += failed_list_dict[component];
      }
    }

    for (let component in total_deployments_dict) {
      if (!failed_list_dict.hasOwnProperty(component)) {
        failure_rate_dict[component] = 0;
      } else {
        failure_rate_dict[component] = Math.round((failed_list_dict[component] / total_deployments_dict[component]) * 100);
      }
    }
    let failureRate = Object.keys(failure_rate_dict).map(function(key) {
      return [key, failure_rate_dict[key]];
    });
    failureRate.push(['all', overall_failure_rate]);
    failureRate.sort(function(first, second) {
      return second[1] - first[1];
    });

    let totalNumDeployments = total_errors + total_successes;
    let totalDeployments = Object.keys(total_deployments_dict).map(function(key) {
      return [key, total_deployments_dict[key]];
    });
    totalDeployments.push(['all', totalNumDeployments]);
    totalDeployments.sort(function(first, second) {
      return second[1] - first[1];
    });
    totalDeployments.splice(5);
    componentErrors.splice(5);
    failureRate.splice(5);
    componentErrorsType.splice(5);
    return {"Total deployments": totalDeployments, "Component Errors": componentErrors, "Component Failure Rates (%)": failureRate, "Component Type Errors": componentErrorsType};
  });
}

//main_handler()
