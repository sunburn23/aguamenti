# -*- coding: utf-8 -*-
"""
Created on Mon Mar 27 09:26:34 2023

@author: Raul CARREIRA RUFATO
"""


import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
from meteostat import Point, Hourly,Daily, Monthly
from datetime import datetime
import warnings
import itertools
warnings.filterwarnings("ignore")
plt.style.use('fivethirtyeight')
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller
def adf_test(timeseries):
    #Perform Dickey-Fuller test:
    print ('Results of Dickey-Fuller Test:')
    dftest = adfuller(timeseries, autolag='AIC')
    dfoutput = pd.Series(dftest[0:4], index=['Test Statistic','p-value','#Lags Used','Number of Observations Used'])
    for key,value in dftest[4].items():
       dfoutput['Critical Value (%s)'%key] = value
    print (dfoutput)
#define function for kpss test
from statsmodels.tsa.stattools import kpss
#define KPSS
def kpss_test(timeseries):
    print ('Results of KPSS Test:')
    kpsstest = kpss(timeseries, regression='c')
    kpss_output = pd.Series(kpsstest[0:3], index=['Test Statistic','p-value','Lags Used'])
    for key,value in kpsstest[3].items():
      kpss_output['Critical Value (%s)'%key] = value
    print (kpss_output)
# Define coordinates for Provence-Alpes-Côte d'Azur
lat, lon = 43.11978329610651, 6.115267811638451
location = Point(lat, lon)

# Set start and end dates
start_date = datetime(1970, 1, 1)
end_date = datetime.now()

# Query Meteostat Hourly API for precipitation data
data = Monthly(location, start_date, end_date).fetch()


# Create DataFrame with precipitation data
df = pd.DataFrame(data)
df = df[['prcp']]
df.columns = ['precipitation']
# Replace NaNs with last valid observation
df = df.fillna(method='ffill')
# Remove rows with missing values
df = df.dropna()

plot_acf(df, lags=50)
plt.show()
plot_pacf(df, lags=50)
plt.show()

from pylab import rcParams
rcParams['figure.figsize'] = 18, 8
decomposition = sm.tsa.seasonal_decompose(df, model='additive',period=12)
fig = decomposition.plot()
plt.show()

#apply adf test on the series
print(adf_test(df))
print(kpss_test(df))

# %% Autotune 
# Set start and end dates
start_date = datetime(1970, 1, 1)
end_date = datetime(2005, 1, 1)

# Query Meteostat Hourly API for precipitation data
data = Monthly(location, start_date, end_date).fetch()


# Create DataFrame with precipitation data
df_train = pd.DataFrame(data)
df_train = df_train[['prcp']]
df_train.columns = ['precipitation']
# Replace NaNs with last valid observation
df_train = df_train.fillna(method='ffill')
# Remove rows with missing values
df_train = df_train.dropna()
p = range(0, 3)
d = range(1,2)
q = range(0, 4)
pdq = list(itertools.product(p, d, q))
seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]

for param in pdq:
    for param_seasonal in seasonal_pdq:
        try:
            mod = sm.tsa.statespace.SARIMAX(df_train,
                                            order=param,
                                            seasonal_order=param_seasonal,
                                            )
            results = mod.fit(method = 'powell')
            print('ARIMA{}x{}12 - AIC:{}'.format(param, param_seasonal, results.aic))
        except:
            continue
#%%
#ARIMA(0, 1, 3)x(2, 1, 0, 12)
#ARIMA(1, 1, 1)x(0, 1, 1, 12)


mod = sm.tsa.statespace.SARIMAX(df_train,
                                order=(0, 1, 3),
                                seasonal_order=(2, 1, 0, 12))
results = mod.fit(method = 'powell')
print(results.summary().tables[1])

results.plot_diagnostics(figsize=(18, 8))
plt.show()
# Set start and end dates
start_date = datetime(1970, 1, 1)
end_date = datetime(2010, 1, 1)

# Query Meteostat Hourly API for precipitation data
data = Monthly(location, start_date, end_date).fetch()


# Create DataFrame with precipitation data
df = pd.DataFrame(data)
df = df[['prcp']]
df.columns = ['precipitation']
# Replace NaNs with last valid observation
df = df.fillna(method='ffill')
# Remove rows with missing values
df = df.dropna()

pred = results.get_prediction(start=datetime(2005, 1, 1), end=datetime(2005, 1, 1) + pd.DateOffset(months=12*5), dynamic=True)
pred_ci = pred.conf_int()
forecast_mean = pred.predicted_mean
# Plot precipitation data and forecast
fig, ax = plt.subplots(figsize=(12, 6))
# Set negative values in forecast and confidence interval to 0
forecast_mean[forecast_mean < 0] = 0
pred_ci[pred_ci < 0] = 0

ax.plot(df.index, df['precipitation'], label='Observed')
ax.plot(forecast_mean.index, forecast_mean, color='r', label='Forecast', alpha=.7)
ax.fill_between(pred_ci.index, pred_ci.iloc[:, 0], pred_ci.iloc[:, 1], color='k', alpha=0.1, label='95% CI')
ax.set_title('Precipitation Forecast')
ax.set_xlabel('Date')
ax.set_ylabel('Precipitation (mm)')
ax.legend()