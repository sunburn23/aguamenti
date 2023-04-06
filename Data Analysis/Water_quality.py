# Import necessary libraries
import pandas as pd # data manipulation
import urllib.request # handling URLs
import json # working with JSON data
import csv # reading/writing CSV files
import io # handling in-memory file objects
import matplotlib.pyplot as plt # data visualization
import statsmodels.api as sm # time series analysis
import itertools # iteration tools
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf # plotting autocorrelation and partial autocorrelation
from statsmodels.tsa.stattools import adfuller # performing Dickey-Fuller test for stationarity

# Set the latitude, longitude, and search radius for finding a river water quality monitoring station
lat, lon = 43.113747373373734, 6.119793960766969 # Those are the locations of Hyères
radius = 10 # km

# Define the URL for querying the EauFrance API for the closest water quality monitoring station
url = f"http://hubeau.eaufrance.fr/api/v2/qualite_rivieres/station_pc?size=20&longitude={lon}&latitude={lat}&distance=8&exact_count=true&format=json&fields=code_station,libelle_station&pretty"

# Send the API request and extract the relevant data
response = urllib.request.urlopen(url)
data = json.loads(response.read())['data'] # The data is a list of the closer stations. One should be selected
                                           # In this case the second station was selected. 
closer_station = data[1]["code_station"] 
"""
=================================  
           Parametres
=================================
Consult website : https://hubeau.eaufrance.fr/sites/default/files/api/demo/qualriv.htm
This is a list of parameters to be analysed.

-> Physico-Chimie de base
    Temperature
    Hydrogene
    Conductivite
    Oxygene         (Saturation d'oxygene')
    Biochimique     (Demande biochimique en oxygene)
    Suspension      (Matières en suspension)
    
-> Composés Azotés et phosphorés
    Ammonium (NH4)
    Azote    (NKJ)
    Nitrates
    Nitrites
    Orthophosphates
    Phosphore
 
 -> Composés Minereaux
    Calcium   
    Chlorures
    Magnesium
    Sulfates
    
 -> Métaux
    Cadmium
    Cuivre
    Nickel
    Plomb 
    Zinc

-> Pesticides
    Atrazine
    Diuron
    Glyphosate

-> Hydrocarbures
    Benzene
    Benzo(a)pyrene
    Tetrachloroethylene
    
"""
# Define the water quality parameter to analyze, and the initial date for the data collection
parametre = "Temperature"
initial_date = "2000-01-01"

# Define the URL for querying the EauFrance API for the water quality data for the chosen station and parameter
data_url = f"http://hubeau.eaufrance.fr/api/v2/qualite_rivieres/analyse_pc?code_station={closer_station}&libelle_parametre={parametre}&date_debut_prelevement={initial_date}&code_qualification=1&pretty&fields=code_station,libelle_parametre,date_prelevement,resultat,symbole_unite,code_remarque&size=1000"

# Send the API request and extract the relevant data
response = urllib.request.urlopen(data_url)
data = json.loads(response.read())['data']

# Extract the headers and data from the API response
headers = data[0].keys()
rows = [d.values() for d in data]

# Write the data to an in-memory CSV file
csv_file = io.StringIO()
writer = csv.writer(csv_file)
writer.writerow(headers)
writer.writerows(rows)

# Convert the CSV data to a Pandas DataFrame
csv_data = csv_file.getvalue()
df = pd.read_csv(io.StringIO(csv_data))

# Convert the date column to a datetime object
df['date_prelevement'] = pd.to_datetime(df['date_prelevement'])

# Set the date column as the DataFrame index, and select only the 'resultat' column
df.set_index('date_prelevement', inplace=True)
df_new = df.loc[:, ['resultat']]
# %% Time series forecast

# Define a function for performing the augmented Dickey-Fuller test on a given time series
def adf_test(timeseries):
    # Print the header for the test results
    print('Results of Dickey-Fuller Test:')
    # Perform the test and store the results in dftest
    dftest = adfuller(timeseries, autolag='AIC')
    # Create a Pandas Series to store the test results and their corresponding labels
    dfoutput = pd.Series(dftest[0:4], index=['Test Statistic', 'p-value', '#Lags Used', 'Number of Observations Used'])
    # Loop through the critical values and their corresponding keys and add them to the Pandas Series
    for key, value in dftest[4].items():
        dfoutput['Critical Value (%s)' % key] = value
    # Print the final test results
    print(dfoutput)

# Define a function for performing the Kwiatkowski-Phillips-Schmidt-Shin (KPSS) test on a given time series
from statsmodels.tsa.stattools import kpss
def kpss_test(timeseries):
    # Print the header for the test results
    print('Results of KPSS Test:')
    # Perform the test and store the results in kpsstest
    kpsstest = kpss(timeseries, regression='c')
    # Create a Pandas Series to store the test results and their corresponding labels
    kpss_output = pd.Series(kpsstest[0:3], index=['Test Statistic', 'p-value', 'Lags Used'])
    # Loop through the critical values and their corresponding keys and add them to the Pandas Series
    for key, value in kpsstest[3].items():
        kpss_output['Critical Value (%s)' % key] = value
    # Print the final test results
    print(kpss_output)

# Plot the autocorrelation function (ACF) and partial autocorrelation function (PACF) for the time series
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
plot_acf(df_new, lags=20)
plt.show()
plot_pacf(df_new, lags=20)
plt.show()

# Set the figure size for the decomposition plot
from pylab import rcParams
rcParams['figure.figsize'] = 18, 8

# Perform a seasonal decomposition of the time series using an additive model and a period of 2
decomposition = sm.tsa.seasonal_decompose(df_new, model='additive', period=2)

# Plot the seasonal decomposition
fig = decomposition.plot()
plt.show()

# Apply the ADF and KPSS tests to the time series and print the results
print(adf_test(df_new))
print(kpss_test(df_new))

# %% Autotune 

# Define the period for training and testing
train_start_date = '2000-09-13'
train_end_date = '2015-12-21'
test_start_date = '2016-03-31'
test_end_date = '2022-03-30'

# Split the DataFrame into training and test sets
train = df_new.loc[train_start_date:train_end_date]
test = df_new.loc[test_start_date:test_end_date]

# Set the range of p, d, and q values for the ARIMA model
p = range(0, 3)
d = range(1,2)
q = range(0, 4)

# Generate all possible combinations of p, d, and q values
pdq = list(itertools.product(p, d, q))

# Generate all possible combinations of seasonal p, d, and q values
seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]

# Loop through all possible combinations of p, d, and q values and
# seasonal p, d, and q values to find the optimal ARIMA model
for param in pdq:
    for param_seasonal in seasonal_pdq:
        try:
            mod = sm.tsa.statespace.SARIMAX(train,
                                            order=param,
                                            seasonal_order=param_seasonal,
                                            )
            results = mod.fit(method = 'powell')
            # Print the AIC value for each model
            print('ARIMA{}x{}12 - AIC:{}'.format(param, param_seasonal, results.aic))
        except:
            # Ignore any models that fail to fit
            continue

# %%
# Create SARIMAX model with specified order and seasonal_order parameters
mod = sm.tsa.statespace.SARIMAX(df_new,
                                order=(2, 1, 3),
                                seasonal_order=(2, 1, 2, 12))

# Fit the model to the training data using Powell optimization method
results = mod.fit(method='powell')

# Print the second table of summary statistics from the results
print(results.summary().tables[1])

# Generate predictions on test data using the fitted model
pred = results.get_prediction(start=test.index[0], end=test.index[-1])

# Get confidence intervals for the predicted values
pred_ci = pred.conf_int()

# Extract the mean forecast values from the predicted data
forecast_mean = pred.predicted_mean

# Create a new figure with specified size
fig, ax = plt.subplots(figsize=(12, 6))

# Set any negative forecast values to 0
forecast_mean[forecast_mean < 0] = 0
pred_ci[pred_ci < 0] = 0

# Plot the observed data
ax.plot(df_new.index, df_new, label='Observed')

# Plot the forecast data in red with alpha = 0.7
ax.plot(forecast_mean.index, forecast_mean, color='r', label='Forecast', alpha=.7)

# Fill in the area between the upper and lower confidence intervals
ax.fill_between(pred_ci.index, pred_ci.iloc[:, 0], pred_ci.iloc[:, 1],
                color='k', alpha=0.1, label='95% CI')

# Set title and axis labels
ax.set_title('Temperature Forecast')
ax.set_xlabel('Date')
ax.set_ylabel('Temperature (°C)')
ax.legend()

# Generate diagnostic plots for the model
results.plot_diagnostics(figsize=(18, 8))
plt.show()
