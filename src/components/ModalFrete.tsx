"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { createCheckoutSession } from '../app/configure/preview/actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Dispatch, SetStateAction } from 'react';

const FormSchema = z.object({
  cep: z.string().length(8, {
    message: "Cep deve ter 8 caracteres.",
  }),
  cidade: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Cidade deve ter no máximo 100 caracteres.",
  }),
  Bairro: z.string().min(2, {
    message: "Bairro deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Bairro deve ter no máximo 100 caracteres.",
  }),
  Rua: z.string().min(2, {
    message: "Rua deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Rua deve ter no máximo 100 caracteres.",
  }),
  Estado: z.string().length(2, {
    message: "Estado deve ter exatamente 2 caracteres.",
  }),
  Complemento: z.string().optional(),
  logi: z.string({
    required_error: "Selecione um serviço de entrega",
  }).min(1, {
    message: "O campo de serviço de entrega não pode ser vazio.",
  }),
});

interface UserEnd {
  localidade: string;
  bairro: string;
  logradouro: string;
  uf: string;
  complemento: string;
}

export default function ModalFrete({
    isFrenetModal,
    setIsFrenetModal,
    idConfig,
  }: {
    isFrenetModal: boolean
    setIsFrenetModal: Dispatch<SetStateAction<boolean>>
    idConfig: string
  }) {
    const router = useRouter()
    const { toast } = useToast()
    const [userEnd, setUserEnd] = useState<UserEnd>({
      localidade: "",
      bairro: "",
      logradouro: "",
      uf: "",
      complemento: "",
    })
    const [cepValue, setCepValue] = useState<string>('')
    const [logistica, setLogistica] = useState<array>([])
    const [errorCep, setErrorCep] = useState<string>('')

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
    })
   
    function onSubmit(data: z.infer<typeof FormSchema>) {

      localStorage.setItem('configurationId', idConfig)
      createPaymentSession({ configId: idConfig, logi: data.logi, userEnd })

      // toast({
      //   title: "You submitted the following values:",
      //   description: (
      //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      //     </pre>
      //   ),
      // })
    }

    const handleQuotes = async () => {
        console.log('chamando api quote')
        const res = await fetch('/api/frenet/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cepValue }),
        });
    
        const data = await res.json();
        setLogistica(data.result.ShippingSevicesArray);
        console.log(data)
    }

    useEffect(() => {
      console.log("userEnd has been updated");
      console.log(userEnd);
      form.reset({
        cep: cepValue,
        cidade: userEnd.localidade,
        Bairro: userEnd.bairro,
        Rua: userEnd.logradouro,
        Estado: userEnd.uf
      });
    }, [userEnd]); // Executa quando userEnd mudar
    
    const handleCEPCalc = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        await debouncedFetchCep(event.target.value);
    }, []);
    
    const debouncedFetchCep = debounce(async (cepValueInput) => {

      setErrorCep('');

    if(cepValueInput.length >= 7){
        console.log('chamando api')
        console.log(cepValueInput)
        const res = await fetch('/api/frenet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cepValueInput }),
        });
    
        const data = await res.json();
        setUserEnd(data.result);

        setCepValue(cepValueInput);

        if(data.result.Message != null){
          setErrorCep(data.result.Message);
        }
        handleQuotes();
    }
    }, 300);

    const { mutate: createPaymentSession } = useMutation({
      mutationKey: ['get-checkout-session'],
      mutationFn: createCheckoutSession,
      onSuccess: ({ url }) => {
        if (url) router.push(url)
        else throw new Error('Unable to retrieve payment URL.')
      },
      onError: () => {
        toast({
          title: 'Something went wrong',
          description: 'There was an error on our end. Please try again.',
          variant: 'destructive',
        })
      },
    })

  return (
    <Dialog onOpenChange={setIsFrenetModal} open={isFrenetModal}>
    <DialogContent className='lg:max-w-screen-lg overflow-y-scroll max-h-screen z-[9999999]'>
      <DialogHeader>
        <DialogTitle className='text-3xl text-center font-bold tracking-tight text-gray-900'>
          Entrega
        </DialogTitle>
        <DialogDescription className='text-base text-center py-2'>
          <span className='font-medium text-zinc-900'>
            Preencha as informaçoes de entrega
          </span>
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="digite seu CEP" onChangeCapture={handleCEPCalc} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {userEnd.localidade != "" && (
            <div>
              <div className='grid md:grid-cols-2 gap-4 pt-4 grid-cols-1'>
                {errorCep ==  '' && (
                  <>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Rua"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </>
                )}
                <div className="grid w-full items-center gap-1">
                  <FormField
                    control={form.control}
                    name="Complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Complemento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='w-full p-6 bg-slate-100 rounded-sm my-5'>
                <FormField
                  control={form.control}
                  name="logi"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                      <RadioGroup onValueChange={field.onChange}>
                        {logistica.map((logi) => {
                          return(
                            <div key={logi.ServiceCode} className="flex items-center space-x-2">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={logi.ServiceDescription + - + logi.ShippingPrice} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
                                    <p>{logi.ServiceDescription} </p>
                                    <p>R${logi.ShippingPrice} </p>
                                    <p className='md:block none'>Entrega em {logi.DeliveryTime} dias uteis</p>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            </div>
                          )
                        })}
                      </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                className='px-4 sm:px-6 lg:px-8'>
                Seguir ao pagamento <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button>
            </div>
          )}
          </form>
        </Form>
      </DialogHeader>
    </DialogContent>
  </Dialog>
  )
}
